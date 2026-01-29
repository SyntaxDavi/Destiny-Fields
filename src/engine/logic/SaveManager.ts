import { Character } from '../entities/Character';

export class SaveManager {
    private static SAVE_KEY = 'rpg_journey_save';
    private static VERSION = 1;

    public static save(hero: Character): void {
        const payload = {
            version: this.VERSION,
            data: hero.toSaveData()
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(payload));
            console.log(`\n💾 Jogo salvo no navegador! (v${this.VERSION})`);
        } else {
            console.log("\n⚠️ Persistência em arquivo não suportada neste ambiente.");
        }
    }

    public static load(): Character | null {
        if (typeof window === 'undefined') return null;

        const json = localStorage.getItem(this.SAVE_KEY);
        if (!json) return null;

        try {
            const payload = JSON.parse(json);

            if (payload.version !== this.VERSION) {
                console.warn(`\n⚠️ Aviso: Versão do save (${payload.version}) diferente da atual (${this.VERSION}).`);
            }

            const hero = new Character({ name: payload.data.name });
            hero.fromSaveData(payload.data);

            console.log(`\n📂 Jogo carregado: ${hero.name} (Nivel ${hero.level})`);
            return hero;
        } catch (error) {
            console.error("\n❌ Erro ao carregar o save:", error);
            return null;
        }
    }
}
