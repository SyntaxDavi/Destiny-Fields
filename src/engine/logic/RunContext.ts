export class RunContext {
    public encounterCount: number = 0;
    public currentBiome: string = "Campos Espirais";
    public isBossDefeated: boolean = false;
    public maxEncounters: number = 5;

    public incrementEncounters(): void {
        this.encounterCount++;
    }

    public shouldSpawnBoss(): boolean {
        return this.encounterCount >= this.maxEncounters && !this.isBossDefeated;
    }

    public reset(): void {
        this.encounterCount = 0;
        this.isBossDefeated = false;
    }
}
