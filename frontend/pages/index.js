import {
	Card,
	Flex,
	Heading,
	Image,
	Pagination,
	View,
} from '@aws-amplify/ui-react'
import { API } from 'aws-amplify'
import { useState } from 'react'

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
`
export default function Home({ users = [], nextToken }) {
	const [pageTokens, setPageTokens] = useState([nextToken])
	const [currentPageNumber, setCurrentPageNumber] = useState(1)
	const [hasMorePages, setHasMorePages] = useState(true)
	const [profileUsers, setProfileUsers] = useState(users)

	const handleNextPage = async () => {
		if (hasMorePages) {
			const currToken = pageTokens[currentPageNumber - 1]
			const {
				data: { listUsers },
			} = await API.graphql({
				query: fetchUsersQuery,
				variables: {
					limit: 5,
					nextToken: currToken,
				},
			})

			const { nextToken, items } = listUsers

			if (!nextToken) {
				setHasMorePages(false)
			}
			setProfileUsers(items)

			if (currentPageNumber < pageTokens.length) {
				setCurrentPageNumber(currentPageNumber + 1)
			}

			if (currentPageNumber === pageTokens.length) {
				setCurrentPageNumber(currentPageNumber + 1)
				setPageTokens([...pageTokens, nextToken])
			}
		}
	}

	const handlePrevPage = async () => {
		const prevToken = pageTokens[currentPageNumber - 2]
		const isFirstPage = currentPageNumber - 2 === 0
		const {
			data: { listUsers },
		} = await API.graphql({
			query: fetchUsersQuery,
			variables: {
				limit: 5,
				nextToken: isFirstPage ? null : prevToken,
			},
		})
		const { items } = listUsers
		console.log(items)
		setProfileUsers(items)
		setCurrentPageNumber(currentPageNumber - 1)
	}
	return (
		<Flex direction={'column'}>
			<Heading textAlign={'center'} level={2}>
				User Profile List
			</Heading>
			<View alignSelf="center">
				<Flex direction={{ small: 'column', medium: 'row' }} wrap="wrap">
					{profileUsers.map(({ userId, picture, firstname, lastname }) => (
						<Card key={userId} variation="elevated">
							<Image height={'250px'} width={'250px'} src={picture} />
							<Heading textAlign={'center'} level={4}>
								{firstname} {lastname}
							</Heading>
						</Card>
					))}
				</Flex>
			</View>
			<Pagination
				currentPage={currentPageNumber}
				totalPages={pageTokens.length}
				hasMorePages={hasMorePages}
				onNext={handleNextPage}
				onPrevious={handlePrevPage}
				onChange={(pageIndex) => setCurrentPageIndex(pageIndex)}
			/>
		</Flex>
	)
}

export async function getStaticProps() {
	const { data } = await API.graphql({
		query: fetchUsersQuery,
		variables: { limit: 5 },
	})

	return {
		props: {
			users: data.listUsers.items,
			nextToken: data.listUsers?.nextToken,
		},
	}
}
