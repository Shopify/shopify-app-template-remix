import React from 'react'
import { Page, Text, TextField, BlockStack, InlineGrid, Card, Divider, useBreakpoints, Box } from '@shopify/polaris';

// This example is for guidance purposes. Copying it will come with caveats.
function AppSettingsLayoutExample() {
    const { smUp } = useBreakpoints();
    return (
        <Page
            primaryAction={{ content: "View on your store", disabled: true }}
            secondaryActions={[
                {
                    content: "Duplicate",
                    accessibilityLabel: "Secondary action label",
                    onAction: () => alert("Duplicate action"),
                },
            ]}
        >
            <BlockStack gap={{ xs: "800", sm: "400" }}>
                <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                    <Box
                        as="section"
                        paddingInlineStart={{ xs: "400", sm: undefined }}
                        paddingInlineEnd={{ xs: "400", sm: undefined }}
                    >
                        <BlockStack gap="400">
                            <Text as="h3" variant="headingMd">
                                InterJambs
                            </Text>
                            <Text as="p" variant="bodyMd">
                                Interjambs are the rounded protruding bits of your puzzlie piece
                            </Text>
                        </BlockStack>
                    </Box>
                    <Card roundedAbove="sm">
                        <BlockStack gap="400">
                            <TextField label="Interjamb style" autoComplete="off" />
                            <TextField label="Interjamb ratio" autoComplete="off" />
                        </BlockStack>
                    </Card>
                </InlineGrid>
                {smUp ? <Divider /> : null}
                <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                    <Box
                        as="section"
                        paddingInlineStart={{ xs: "400", sm: undefined }}
                        paddingInlineEnd={{ xs: "400", sm: undefined }}
                    >
                        <BlockStack gap="400">
                            <Text as="h3" variant="headingMd">
                                Dimensions
                            </Text>
                            <Text as="p" variant="bodyMd">
                                Interjambs are the rounded protruding bits of your puzzlie piece
                            </Text>
                        </BlockStack>
                    </Box>
                    <Card roundedAbove="sm">
                        <BlockStack gap="400">
                            <TextField label="Horizontal" autoComplete="off" />
                            <TextField label="Vertical" autoComplete="off" />
                        </BlockStack>
                    </Card>
                </InlineGrid>
            </BlockStack>
        </Page>
    )
}

export default AppSettingsLayoutExample;

