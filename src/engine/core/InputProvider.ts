export interface ChoiceOption {
    id: string;
    label: string;
}

export interface ChoiceContext {
    actorName: string;
    type: 'COMBAT_REACTION' | 'ADVENTURE_DECISION' | 'CAMP_ACTION';
    metadata?: any;
}

export interface InputProvider {
    requestChoice(
        title: string,
        options: ChoiceOption[],
        context: ChoiceContext
    ): Promise<string>;

    requestConfirmation(message: string): Promise<boolean>;
}
