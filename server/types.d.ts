declare module 'connect-sqlite3' {
    import { Store } from 'express-session';
    export default function (session: any): {
        new(options?: any): Store;
    }
}
