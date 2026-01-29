export interface InputProvider {
    requestChoice(title: string, options: string[]): Promise<number>;
    requestConfirmation(message: string): Promise<boolean>;
}
