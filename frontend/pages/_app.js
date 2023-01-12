import { AmplifyProvider } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { Amplify } from 'aws-amplify'

Amplify.configure({
	aws_project_region: 'us-east-1',
	aws_appsync_graphqlEndpoint:
		'https://c4wds3boinhrdemdnqkt5uztny.appsync-api.us-east-1.amazonaws.com/graphql',
	aws_appsync_region: 'us-east-1',
	aws_appsync_authenticationType: 'API_KEY',
	aws_appsync_apiKey: 'da2-ze45yo5nm5dttnnsvkyoxwbbvq',
})

function MyApp({ Component, pageProps }) {
	return (
		<AmplifyProvider>
			<Component {...pageProps} />
		</AmplifyProvider>
	)
}

export default MyApp
