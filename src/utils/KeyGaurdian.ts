import { Client } from "@vex-chat/libvex";

class KeyGaurdian {
    private static instance: KeyGaurdian;

    private SK: string | null = null;

    // The constructor is empty because we need to make it private.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): KeyGaurdian {
        if (!KeyGaurdian.instance) {
            KeyGaurdian.instance = new KeyGaurdian();
        }

        return KeyGaurdian.instance;
    }

    public hasKey(): boolean {
        return this.SK !== null;
    }

    public getKey(): string {
        if (!this.SK) {
            throw new Error("Must call load() before using this function.");
        }
        return this.SK;
    }

    public load(path: string, password: string): void {
        const SK = Client.loadKeyFile(path, password);
        this.SK = SK;
    }

    public clear(): void {
        this.SK = null;
    }
}

const guardian = KeyGaurdian.getInstance();

export default guardian;
