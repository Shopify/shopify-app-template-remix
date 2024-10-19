import { Page, Card, Text } from '@shopify/polaris';
import React from 'react';

function AppService() {
    return (
        <Page
            title="Services"
            actionGroups={[
                {
                    title: 'Copy',
                    onClick: (openActions) => {
                        alert('Copy action');
                        openActions();
                    },
                    actions: [{ content: 'Copy to clipboard' }],
                },
                {
                    title: 'Promote',
                    disabled: true,
                    actions: [{ content: 'Share on Facebook' }],
                },
                {
                    title: 'More actions',
                    actions: [
                        { content: 'Duplicate' },
                        { content: 'Print' },
                        { content: 'Unarchive' },
                        { content: 'Cancel order' },
                    ],
                },
            ]}
        >
            <Card>
                <Text as="h2" variant="bodyMd">
                    Content inside a card
                </Text>
            </Card>
        </Page>
    );
}

export default AppService;