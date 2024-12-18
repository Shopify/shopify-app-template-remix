import { UnitValue } from './general.field.entity';

export declare namespace ActionTypeEntity {
    type ActionType = 'no' | 'url' | 'popup' | 'scroll' | 'email' | 'phone';
    interface ActionItemValidate {
        /** Gửi email nếu action được active */
        email: string;
        /** Gọi điện thoại nếu action được active */
        phone: string;
        /** Vị trí offset nếu action được active */
        topOffset: UnitValue;
    }
    interface ActionItem extends Partial<ActionItemValidate> {
        /** Kiểu của action khi được active */
        actionType: ActionType;
        /** Tiêu đề của email (nếu có), dùng cho action email khi được active */
        emailSubject?: string;
        /** Nội dung của email (nếu có), dùng cho action email khi được active */
        emailBody?: string;
        /** Link redirect url (nếu có), dùng cho action url khi được active */
        url?: string;
        /** Trạng thái khi rediect url có chuyển sang tab mới không */
        openNewTab?: boolean;
        /** Scroll đến vị trí offset khi action được active */
        scrollTo?: string;
    }
}
