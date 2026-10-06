// Short rules texts, shown when tapping a tile (result page) or its info icon (selection pages).
// Key = objective/pawn id. Use **double asterisks** for bold. Leave '' for no text (no info icon is shown).
export const RULES: Record<string, string> = {
  // Objectives
  'base-airport': "The Airport must be placed in the same row or column as at least 1 Town tile that is part of a City.", // Airport
  'base-central-station': "The Central Station must be connected to at least 5 Stations only counting Railroad paths.", // Central Station
  'base-city-hall': "The City Hall must have at least 2 adjacent tiles in each of the four orthogonal directions (up, down, left, right).", // City Hall
  'base-gas-station': "The Gas Station must be part of a continous path with at least 8 connected Highway segments; in case of looping paths, the same Highway segment cannot be counted more than once.", // Gas Station
  'base-metropolis': "The Metropolis must be part of a City made of at least 5 Town tiles.", // Metropolis
  'base-stadium': "The Stadium must have at least 3 Traveler pawns in the tiles that surround it.", // Stadium
  'base-temple': "The Temple must not have any Car nor Train Pinpoints on the tiles that surround it.", // Temple
  'world-cemetery': "The Cemetery must be completely surrounded by other tiles (8 tiles).", // Cemetery
  'world-factory': "The Factory must have at last 3 Trains on the tiles that surround it.", // Factory
  'world-hotel': "The Hotel must be in the same row and/or column as at least 4 Stations. This tile counts as a Town tile.", // Hotel
  'world-junkyard': "The Junkyard must not have any Town tiles in hte spaces surrounding it.", // Junkyard
  'world-military-base': "The Military Base must not have any Stations on the tiles that surround it.", // Military Base
  'world-observatory': "The Observatory must be placed in the same row or column as at least 6 other tiles.", // Observatory
  'world-quarry': "The Quarry must be part of a continous path with at least 8 connected Railroad segments; in case of looping paths, the same Railroad segment cannot be counted more than once.", // Quarry
  'world-racing-stands': "The Racing Stands must be part of a Highway loop: a path made of Highway segments that returns to the starting point, passing through each segment only once.", // Racing Stands
  'world-swamp': "The Swamp must not have any Traveler Pinpoints on the tiles that surround it.", // Swamp
  'world-theme-park': "The Theme Park must have at least 2 Cities connected to it only through Highways.", // Theme Park
  'promo-hospital': "The Hospital must have at least 4 Town tiles in the spaces surrounding it.", // Hospital
  'promo-local-market': "The Local Market must have at least 3 Car pawns on the tiles that surround it.", // Local Market
  'countryside-hills': "The Hills must have at least 3 Animal pawns on the tiles that surround it.", // Hills
  'countryside-vineyard': "The Vineyard must be part of a Pasture that spans at least 5 tiles and contains no Animal pawn.", // Vineyard
  'countryside-windmill': "The Windmill must be part of a Pasture that spans at least 10 tiles.", // Windmill
  'desert-desert-market': "The Desert Market must be part of a continous path with at least 5 connected Desert Trail segments; in case of looping paths, the same Desert Trail segment cannot be counted more than once.", // Desert Market
  'desert-desert-temple': "The Desert Temple must be connected to at last 4 Landmarks", // Desert Temple
  'desert-great-oasis': "The Great Oasis must have at least 2 Camels in the tiles that surround it. This tile counts as an Oasis Landmark.", // Great Oasis
  'monuments-castle': "The Castle must have at least 2 Tower Monument pawns on the tiles that surround it.", // Castle
  'monuments-museum': "Your Archaeologist must end the game on the Museum tile or on any tile orthogonally adjacent to it. This tile counts as a Town tile.", // Museum
  'monuments-royal-gardens': "The Royal Gardens must have at least 2 Arch Monument pawns in its row and/or column.", // Royal Gardens
  'energy-casino': "The Casino must be orthogonally adjacent to at least 1 Town tile that is part of a City where all Town tiles are Energized.", // Casino
  'energy-laboratory': "The Laboratory must have at least 3 connected Wind Turbines in the tiles that surround it.", // Laboratory
  'energy-solar-farm': "The Cables in all 4 corners of the Solar Farm must each be connected to at least 1 Wind Turbine.", // Solar Farm
  'forest-campgrounds': "The Campgrounds must have at least 1 **Lookout Tower** at any distance in at least 3 orthogonal directions.", // Campgrounds
  'forest-nature-reserve': "The Nature Reserve must be connected to tiles in all 4 orthogonal directions and must be part of a Forest.", // Nature Reserve
  'forest-witchs-house': "The With's House must not have any **Lookout Towers** at any distance in either orthogonal or diagonal directions.", // Witch's House
  'canals-doges-tower': "The Doge's Tower must have at least 1 Bridge in its row and/or column in each of 2 different directions, at any distance.", // Doge's Tower
  'canals-tourist-plaza': "The Tourist Plaza must have at least 2 Gondolas on the tiles that surround it.", // Tourist Plaza
  'canals-watermill': "The Watermill must be part of a Canal loop: a path that returns to its starting point, passing through each Canal segment only once.", // Watermill
  'lakes-fisher-island': "The Fisher Island must be part of a Lake with at least 6 Ports.", // Fisher Island
  'lakes-hydroelectric-plant': "The Hydroelectric Plant must be part of an enclosed Lage spanning at least 4 tiles.", // Hydroelectric Plant
  'lakes-lighthouse': "The Lighthouse must have at least 2 Ferry pawns on the tiles that surround it.", // Lighthouse
  // Special pawns
  'car-bus': "When you place the Bus, you gain 2 additional points if there is at least 1 Traveler connected to this pawn's Pinpoint only through Highways.", // Bus
  'car-cement-mixer': "When you place the Cement Mixer, you may draw a Route tile form the bag. If you do, you **must** place the tile following the regular rules.", // Cement Mixer
  'car-off-road-vehicle': "When you place the Off-Road Vehicle, you gain 2 additional points if there is a \"Dead-End Highway\" tile connected to this pawn's Pinpoint only through Highways.", // Off-Road Vehicle
  'car-racing-car': "When you place the Racing Car, you gain 2 additional points if there are no other Cars connected to this pawn's Pinpoint within 2 tiles distance only through Highways.", // Racing Car
  'car-tow-truck': "When you place the Tow Truck, you may remove any Car pawn connected to this pawn's Pinpoint only through Highways to gain 2 points.", // Tow Truck
  'car-tractor': "When you place the Tractor, you gain 2 additional points if there are no Town tiles in the spaces surrounding it.", // Tractor
  'train-bullet-train': "When you place the Bullet Train, you gain 2 additional points if there is a \"Straight Railway\" tile connected to this pawn's Pinpoint only through Railways.", // Bullet Train
  'train-cargo-wagon': "When you place the Cargo Wagon, you gain 2 additional points if there are no Stations on the tiles that surround it.", // Cargo Wagon
  'train-circus-wagon': "Once placed, the Circus Wagon counts as a Traveler Pinpoint.", // Circus Wagon
  'train-crane-wagon': "When you place the Crane Wagon, you can move a previously placed tile (without any pawns on it) to a new position in your play area, following the regular placement rules.", // Crane Wagon
  'train-light-rail': "When you place the Light Rail, you gain 2 additional points if there is a Town tile that is part of a City which is connected to this pawn's Pinpoint only through Railroads.", // Light Rail
  'train-steam-train': "When you place the Steam Train, you gain 2 additional points if there is a Station connected to this pawn's Pinpoint within 2 tiles distance only through Railroads.", // Steam Train
  'traveler-dog': "You may place the Dog on any tile containing a Traveler, even without an empty Pinpoint.", // Dog
  'traveler-family': "When you place the Family, you gain 2 additional points if there is at least 1 Traveler connected to this pawn's Pinpoint only through either Highways or Railroads (without switching at Stations).", // Family
  'traveler-mayor': "When you place the Mayor, you gain 2 additional points if it is placed within your Biggest Rectangle at the time when you place it.", // Mayor
  'traveler-mechanic': "You may place the Mechanic on a Train Pinpoint. If you do, you gain 1 additional point.", // Mechanic
  'traveler-police-officer': "You may place the Police Officer on any tile where 3 or more Highway segments intersect, even without a Pinpoint. If you do, you gain 1 additional point.", // Police Officer
  'traveler-thief': "You may place the Thief on any tile with a Station, even without a Pinpoint.", // Thief
  'traveler-tourist': "You may place the Tourist on any tile that you placed during the current round, even without a Pinpoint.", // Tourist
}
