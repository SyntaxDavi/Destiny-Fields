// Removed CLI-specific dependencies to allow browser bundling.
export class CharacterCreator {
    public static create(): any {
        throw new Error("CharacterCreator.create() is not supported in the web version.");
    }
}
