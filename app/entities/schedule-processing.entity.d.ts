export declare namespace ScheduleProcessingEntity {
    interface Default {
        _id: string;
        myshopify: string;
        executionTime: Date;
    }
    interface UninstallationApp extends Default {
        type: 'uninstallation-app';
    }
    type Item = UninstallationApp;
    type ItemType = Item['type'];
    interface ResponseItem extends Item {
    }
}
