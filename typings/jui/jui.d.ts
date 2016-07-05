
declare namespace jui {
   export interface FormElement {
        field?: string;
        label?: string;
        type?: 'groupLayout' | 'html' | 'juSelect' | 'file' | string;
        change?: (event: {}) => void;
        validators?: Function | Array<Function>;
        viewMode?: 'select' | 'checkbox' | 'radio';
        sort?: boolean;
        data?: Array<any>;
        size?: number;
        offset?: number;
        labelPos?: 'left' | 'top';
        groupName?: string;
        isContainer?: boolean;
        exp?: string;
        items?: Array<Array<FormElement>>;
        inputs?: Array<FormElement>;
        tabs?: {};
        content?: string;
    }
    export interface FormOptions {
        title?: string;
        labelPos?: 'left' | 'top';
        labelSize?: number;
        refreshBy?: {};
        inputs?: Array<FormElement>;
        tabs?: { string: Array<FormElement> };
        buttons?: { string: { type: 'submit' | 'cancel' | 'button', cssClass?: string, icon?: string, click?: (event: any) => void } };
    }
}
declare module 'jui' {
    export = jui;
}