// Additional setup rules per expansion. Edit the texts here (placeholders for now).
// - Key = expansion id (lowercase name, see src/data.ts).
// - Each string is one step. Wrap text in **double asterisks** to make it bold.
// - Image: public/images/setup/<id>.png (shown next to the steps; hidden if missing).
export const SETUP_RULES: Record<string, string[]> = {
  canals: ['Shuffle all the **Canal Route tiles** inside the Expansion bag.', 'Add the **Gondola pawns**, the **Bridge pawns**, and the **Canal End tokens** to the general pool.'],
  countryside: ['Shuffle all the **Countryside Route tiles** and place them in a face-down stack.', 'Shuffle all 3 types of **Animal pawns** together inside the Expansion bag.'],
  desert: ['Shuffle all the **Desert Route tiles** inside the Expansion bag.', 'Add all **Camel pawns** and **Desert Station tokens** to the general pool.', 'Remove the 3 Placement tokens with a Train Pinpoint from the game and add the **3 Camel Placement tokens** in their place. Shuffle them with the other Placement tokens before you create the stack on the Clock space of the Station board.'],
  energy: ['Shuffle all the **Energy Route tiles** inside the Expansion bag.', 'Add the **Wind Turbine pawns** to the general pool of pawns.', 'Remove the 3 Placement tokens with Car, Train, and Traveler (the ones without the Objective flag) from the game, and add the **3 Wind Turbine Placement tokens** in their place. Shuffle them with the other Placement tokens before you create the stack on the Clock space of the Station board.'],
  forest: ['Shuffle all the **Forest Route tiles** inside the Expansion bag.', 'Add the **Lookout Tower pawns** to the general pool of pawns.', 'Remove the 3 Placement tokens with Car, Train, and Traveler (the ones without the Objective flag) from the game, and add the **3 Lookout Tower Placement tokens** in their place. Shuffle them with the other Placement tokens before you create the stack on the Clock space of the Station board.'],
  lakes: ['Shuffle all the **Lake Route tiles** inside the Expansion bag.', 'Add the **Ferry pawns** and the **Port tokens** to the general pool.', 'Remove the 3 Placement tokens with Car, Train, and Traveler (the ones without the Objective flag) from the game, and add the **3 Ferry Placement tokens** in their place. Shuffle them with the other Placement tokens before you create the stack on the Clock space of the Station board.'],
  monuments: ['Shuffle all the **Monument Route tiles** inside the Expansion bag.', 'Add the **Monument pawns** to the general pool of pawns.', 'Place your **Archeologist Pawn** on your Starting tile.'],
}

export const setupImage = (id: string) => `images/setup/${id}.png`

/** Splits "a **b** c" into parts so bold can be rendered without v-html. */
export const parseBold = (text: string): { text: string; bold: boolean }[] =>
  text
    .split('**')
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((p) => p.text)
