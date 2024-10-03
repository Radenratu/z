const axios = require('axios');

module.exports = {
  config: {
    name: "pokedex",
    aliases: ["pkdx"],
    version: "1",
    author: "Edinst",
    countDown: 5,
    role: 0,
    description: { en: "Search for a Pokémon by name" },
    category: "fun",
    guide: {
      en: {
        example: "{pn} <name>"
      }
    },
    langs: {
      en: {
        error: "Error: Unable to find Pokémon",
        success: "Here is the Pokémon you searched for:"
      }
    }
  },

  onStart: async function ({ message, api, args }) {
    if (!args[0]) {
      message.reply("Please provide a Pokémon name");
      return;
    }

    const pokemonName = args[0].toLowerCase();

    try {
      const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
      const pokeApiResponse = await axios.get(pokeApiUrl);
      const pokeApiData = pokeApiResponse.data;

      let msg = `Nama: ${pokeApiData.name}\n`;
      msg += `Tipe: `;
      pokeApiData.types.forEach((type, index) => {
        msg += `${type.type.name}${index < pokeApiData.types.length - 1 ? ' / ' : ''}`;
      });
      msg += `\n`;

      try {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`;
        const speciesResponse = await axios.get(speciesUrl);
        const speciesData = speciesResponse.data;

        const flavorText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
        const translatedFlavorText = await utils.translate(flavorText, 'id');
        msg += `Deskripsi: ${translatedFlavorText}\n\n`;
      } catch (error) {
        msg += `Deskripsi: Not found\n\n`;
      }

      msg += `STATUS:\n`;
      msg += `Hp: ${pokeApiData.stats[0].base_stat}\n`;
      msg += `Attack damage: ${pokeApiData.stats[1].base_stat}\n`;
      msg += `Defense: ${pokeApiData.stats[2].base_stat}\n`;
      msg += `Spesial attack: ${pokeApiData.stats[3].base_stat}\n\n`;

      msg += `Abilities: `;
      pokeApiData.abilities.forEach((ability, index) => {
        msg += `${ability.ability.name}${index < pokeApiData.abilities.length - 1 ? ', ' : ''}`;
      });

      // Get the Pokémon image URL
      const pokeApiImageUrl = pokeApiData.sprites.front_default;

      // Send the message with the image attachment
      message.send(msg);
      message.send({
        attachment: await global.utils.getStreamFromURL(pokeApiImageUrl)
      });
    } catch (error) {
      message.reply(`Error: ${error}`);
    }
  }
};