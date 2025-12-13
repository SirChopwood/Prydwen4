export const cardRarity: Record<number, { name: string, colour: string, chances: number }> = {
    0: {name: "Common", colour: "#e3e3e3", chances: 1000},
    1: {name: "Uncommon", colour: "#2946bb", chances: 500},
    2: {name: "Rare", colour: "#29bba3", chances: 200},
    3: {name: "Very Rare", colour: "#44bb29", chances: 50},
    4: {name: "Epic", colour: "#e5bd0b", chances: 20},
    5: {name: "Legendary", colour: "#e5620b", chances: 5},
    6: {name: "Unique", colour: "#cc1919", chances: 1},
}

export type Card = {
    "name": string,
    "description": string,
    "file": string,
    "rarity": number
}

export interface DBCard extends Card {
    id: number
}