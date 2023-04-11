import {json} from '@remix-run/node'
import {useLoaderData, useTransition} from '@remix-run/react'
import {authenticator} from '../shopify/authenticator.server.js'
import {Card, Page, Layout, TextContainer, Image, Stack, Link, Heading} from '@shopify/polaris'
import {ProductsCard} from '../components/ProductsCard'
import trophyImage from '../assets/home-trophy.png'
import {useSubmit} from '@remix-run/react'

export const loader = async ({request}) => {
  const {admin} = await authenticator.authenticate('shopify-app', request);
  const result = await admin.fetch('/products/count.json')
  return json(result)
}

export async function action({request}) {
  const {admin} = await authenticator.authenticate('shopify-app', request);
  await Promise.all(
    [...Array(5).keys()].map(async (i) => {
      await admin.mutate(
        `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }
    `,
        {
          input: {
            title: `${randomTitle()}`,
            variants: [{price: randomPrice()}],
          },
        },
      )
    }),
  )
  const result = await admin.fetch('/products/count.json')
  return json(result)
}

export default function Index() {
  const data = useLoaderData()
  const transition = useTransition()
  const submit = useSubmit()

  function handlePopulateProducts(event) {
    event.preventDefault()
    submit({action: 'create-products'}, {replace: true, method: 'POST'})
  }

  const populatingProducts =
    transition.state == 'submitting' && transition.submission.formData.get('action') == 'create-products'

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack wrap={false} spacing="extraTight" distribution="trailing" alignment="center">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>Nice work on building a Shopify app 🎉</Heading>
                  <p>
                    Your app is ready to explore! It contains everything you need to get started including the{' '}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{' '}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{' '}
                    <Link url="https://shopify.dev/apps/tools/app-bridge" external>
                      App Bridge
                    </Link>{' '}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample products to view and test in your store.{' '}
                  </p>
                  <p>
                    Learn more about building out your app in{' '}
                    <Link url="https://shopify.dev/apps/getting-started/add-functionality" external>
                      this Shopify tutorial
                    </Link>{' '}
                    📚{' '}
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{padding: '0 20px'}}>
                  <Image source={trophyImage} alt="Nice work on building a Shopify app" width={120} />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard count={data?.count} handlePopulate={handlePopulateProducts} populating={populatingProducts} />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adjective} ${noun}`
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100
}

const ADJECTIVES = [
  'autumn',
  'hidden',
  'bitter',
  'misty',
  'silent',
  'empty',
  'dry',
  'dark',
  'summer',
  'icy',
  'delicate',
  'quiet',
  'white',
  'cool',
  'spring',
  'winter',
  'patient',
  'twilight',
  'dawn',
  'crimson',
  'wispy',
  'weathered',
  'blue',
  'billowing',
  'broken',
  'cold',
  'damp',
  'falling',
  'frosty',
  'green',
  'long',
]

const NOUNS = [
  'waterfall',
  'river',
  'breeze',
  'moon',
  'rain',
  'wind',
  'sea',
  'morning',
  'snow',
  'lake',
  'sunset',
  'pine',
  'shadow',
  'leaf',
  'dawn',
  'glitter',
  'forest',
  'hill',
  'cloud',
  'meadow',
  'sun',
  'glade',
  'bird',
  'brook',
  'butterfly',
  'bush',
  'dew',
  'dust',
  'field',
  'fire',
  'flower',
]
