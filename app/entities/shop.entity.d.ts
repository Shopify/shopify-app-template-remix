export declare namespace ShopEntity {
    type AppName = 'builder';
    interface AppDetail {
        name: AppName;
        /**
         */
        iid?: number;
        scriptTagId: number;
        metafield?: number[];
        plan: string;
        accessToken: string;
        purchase: number;
        isReview?: boolean;
        install: number;
    }
    interface Item {
        _id: string;
        myshopify: string;
        url: string;
        frozen: boolean;
        passwordEnabled: boolean;
        supportsSe: boolean;
        supportsAb: boolean;
        mainTheme: number;
        primaryDomain: string;
        app: AppDetail;
    }
}
