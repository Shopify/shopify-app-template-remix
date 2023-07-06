export async function getDiscountCodes(admin) {
  const response = await admin.graphql(DISCOUNT_QUERY, {
    variables: {
      first: 10,
    },
  });

  const body = await response.json();
  const discounts = body.data.codeDiscountNodes.nodes.map(
    ({ id, codeDiscount }) => ({
      label: codeDiscount.codes.nodes[0].code,
      value: id,
    })
  );

  return discounts;
}

const DISCOUNT_QUERY = `
  query shopData($first: Int!) {
    codeDiscountNodes(first: $first) {
      nodes {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeBxgy {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
        }
      }
    }
  }
`;
