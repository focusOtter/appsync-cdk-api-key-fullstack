# Secure AWS AppSync with API Keys using the AWS CDK

> (checkout the branches for the IAM permission setup)

This repo walks through the steps needed to get setup an AppSync API that is protected with an API Key.

```ts
// valid, but simplified
const api = new GraphqlApi(this, 'User API', {
	name: 'User API',
	schema: Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
	authorizationConfig: {
		defaultAuthorization: {
			authorizationType: AuthorizationType.API_KEY,
		},
	},
})
```

![architecture diagram](./readmeImages/archDiagram.png)

# Content Channels

- AWS blog post: [Secure AWS AppSync with API Keys using the AWS CDK](https://aws.amazon.com/blogs/mobile/secure-aws-appsync-with-api-keys-using-the-aws-cdk/)
- Focus Otter blog post: [The case for fullstack teams having a dedicated frontend and backend](https://blog.focusotter.com/the-case-for-fullstack-teams-having-dedicated-frontends-and-backends)
- Focus Otter YouTube Video: [The complete beginners guide to creating fullstack apps using the AWS CDK](https://www.youtube.com/watch?v=GBPDeic5fPE&t=8s)
- TikTok: [Understanding the different parts of AWS Amplify](https://www.tiktok.com/@focusotter/video/7163939491441347882)
- Copy/paste snip pic: [link to view](https://snappify.io/view/30dd5f9c-3fea-42b7-a293-999b3828f1b7)

## Project Overview

The core of the appl

The deployed project is meant to work with a frontend (see link to frontend repo below), thereby creating a fullstack application. In addition to an AppSync API, a DynamoDB table is created to hold `User` data and a Lambda function is created to populate the table on a schedule.

[On the frontend](https://github.com/focusOtter/appsync-apikey-pagination-frontend), use of the AWS Amplify JS libraries are used to connect our frontend to our backend by means of the `Amplify.configure` method (sample data configs are used):

```js
Amplify.configure({
	aws_project_region: 'us-east-1',
	aws_appsync_graphqlEndpoint:
		'https://c4wds3boinhrdemdnqkt5uztny.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'da2-ze45yo5nm5dttnnsvkyoxwbbvq',
})
```

With our frontend cofigured to work with out backend, and our Lambda function seeding out database, the frontend will display user data styled with the AWS [Amplify UI Components](https://ui.docs.amplify.aws/)

![user profile](./readmeImages/userProfile.png)

> Note the frontend repo also has a dedicated branch to show the _slight_ change needed for IAM authorization.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

--------FRONTEND-------------------

# Fetch Data from a DynamoDB Database with AWS Amplify

> This repo is part of a fullstack application. The backend can be found [here](https://github.com/focusOtter/cdk-appsync-guests).

Using a NextJS app with the [AWS Amplify JavaScript libraries](https://docs.amplify.aws/lib/q/platform/js/), we can hook into AWS resources. This frontend demonstrates hooking into an AppSync API that is protected with the an API Key.

```ts
// replace with your own keys
Amplify.configure({
	aws_project_region: 'us-east-1',
	aws_appsync_graphqlEndpoint:
		'https://c4wds3boinhrdemdnqkt5uztny.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'da2-ze45yo5nm5dttnnsvkyoxwbbvq',
})
```

In addition to configuring our frontend, the Amplify libraries also provide several ways to [call our backend](https://github.com/focusOtter/appsync-apikey-pagination-frontend/blob/main/pages/index.js#L12-L28) depending on how much or little we want our frontend to make use of Amplify:

```ts
//alternatively, run the following commands in your terminal:
// 1. npm i -g @aws-amplify/cli -g
// 2. amplify init -y
// 3. amplify add codegen --apiId YOUR-API-ID 😎
const fetchUsersQuery = `
  query ListUsers($limit: Int, $nextToken: String) {
    listUsers(limit: $limit, nextToken: $nextToken) {
      items {
        userId
        firstname
        lastname
        picture
      }
      nextToken
    }
  }
```

Note the `nextToken` field. This will return a token if there are more users available. This is how pagination is done in GraphQL.

For styling the [AWS Amplify UI library])(https://ui.docs.amplify.aws/) is used to create the following page when the application is run with `npm run dev`:

![user profile](./readmeImages/userProfile.png)

## Content Created

- AWS blog post: [Secure AWS AppSync with API Keys using the AWS CDK](https://aws.amazon.com/blogs/mobile/secure-aws-appsync-with-api-keys-using-the-aws-cdk/)
