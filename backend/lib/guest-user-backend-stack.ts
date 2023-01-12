import {
	CfnOutput,
	Duration,
	Expiration,
	RemovalPolicy,
	Stack,
	StackProps,
} from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import {
	AppsyncFunction,
	AuthorizationType,
	Code as AppSyncCode,
	FieldLogLevel,
	FunctionRuntime,
	GraphqlApi,
	Resolver,
	SchemaFile,
} from 'aws-cdk-lib/aws-appsync'
import { Construct } from 'constructs'

import * as path from 'path'
import { Schedule, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda'

export class GuestUserStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)

		const userTable = new Table(this, 'UsersAPITable', {
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: 'userId', type: AttributeType.STRING },
		})

		const api = new GraphqlApi(this, 'UsersAPI', {
			name: 'UsersAPI',
			schema: SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql')),
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: AuthorizationType.API_KEY,
				},
			},
			logConfig: {
				fieldLogLevel: FieldLogLevel.ALL,
			},
			xrayEnabled: true,
		})

		// Create the AppSync function
		const listUsersFunction = new AppsyncFunction(this, 'listUsersFunction', {
			name: 'listUsersFunction',
			api,
			dataSource: api.addDynamoDbDataSource('listUsers', userTable),
			code: AppSyncCode.fromAsset('./mappings/Query.listUsers.js'),
			runtime: FunctionRuntime.JS_1_0_0,
		})

		//Create the pipeline
		new Resolver(this, 'PipelineResolver', {
			api,
			typeName: 'Query',
			fieldName: 'listUsers',
			code: AppSyncCode.fromInline(`
    // The before step (no before steps)
    export function request() {
      return {}
    }

    // The after step (simply return the result)
    export function response() {
      return ctx.prev.result
    }
  `),
			runtime: FunctionRuntime.JS_1_0_0,
			pipelineConfig: [listUsersFunction],
		})

		const addUserLambda = new Function(this, 'addUserFunction', {
			runtime: Runtime.NODEJS_16_X,
			handler: 'index.main',
			code: Code.fromAsset(path.join(__dirname, 'functions/addUserLambda')),
			environment: {
				TABLENAME: userTable.tableName,
			},
		})

		userTable.grantWriteData(addUserLambda)

		new Rule(this, 'addUserRule', {
			schedule: Schedule.rate(Duration.minutes(5)),
			targets: [new LambdaFunction(addUserLambda)],
		})

		new CfnOutput(this, 'GraphQLAPIID', {
			value: api.apiId,
		})

		new CfnOutput(this, 'GraphQLURL', {
			value: api.graphqlUrl,
		})

		new CfnOutput(this, 'GraphQLAPIKey', {
			value: api.apiKey || '',
		})
	}
}
