require('dotenv').config();

const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    EmbedBuilder,
    InteractionResponseType,
    MessageFlags,
    Colors
} = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

const database = {
    'projects-unity': {
        name: 'Unity Projects',
        category: 'Unity',
        emoji: '❗',
        color: Colors.Blue,
        description: 'Get projects for Gorilla Tag Copies, and Fan Games.',
        tags: ['projects', 'project'],
        message: {
            title: 'Unity Projects',
            description: 'Need unity projects? We\'re here to supply!',
            fields: [
                { name: '⛱ Summer 2022', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
                { name: '🎨 Paint Brawl 2022', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false }
            ],
            footer: 'Available 24/7 for your convenience • email soon...'
        }
    }
    // 'projects-ue': {
    //     name: 'Unreal Engine Projects',
    //     category: 'Unreal Engine',
    //     emoji: '❗',
    //     color: Colors.Blue,
    //     description: 'Get projects for Unreal Engine Games.',
    //     tags: ['projects', 'project'],
    //     message: {
    //         title: 'Unreal Engine Projects',
    //         description: 'Need unreal engine projects? We\'re here to supply!',
    //         fields: [
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false },
    //             { name: '🤖 Orion Drift 2025', value: 'https://discord.com/channels/1384979421231976658/1387309639376568340', inline: false }
    //         ],
    //         footer: 'Available 24/7 for your convenience • email soon...'
    //     }
    // }
};

const dbCommand = new SlashCommandBuilder()
    .setName('db')
    .setDescription('Search through database options and get detailed information')
    .addStringOption(option =>
        option.setName('search')
            .setDescription('Search for specific content (optional)')
            .setRequired(false)
    );

client.once('ready', async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${Object.keys(database).length} database entries`);
    
    try {
        await client.application.commands.create(dbCommand);
        console.log('✅ Slash command registered successfully!');
    } catch (error) {
        console.error('❌ Error registering slash command:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand() && interaction.commandName === 'db') {
            await handleDbCommand(interaction);
        }
        
        if (interaction.isStringSelectMenu() && interaction.customId === 'db_select') {
            await handleDbSelection(interaction);
        }
    } catch (error) {
        console.error('❌ Error handling interaction:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Error')
            .setDescription('Something went wrong while processing your request.')
            .setTimestamp();
        
        const replyOptions = { 
            embeds: [errorEmbed], 
            flags: MessageFlags.Ephemeral 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});

async function handleDbCommand(interaction) {
    const searchTerm = interaction.options.getString('search');
    let filteredEntries = Object.entries(database);
    let searchResults = [];
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        
        filteredEntries.forEach(([key, value]) => {
            let relevanceScore = 0;
            let matchReasons = [];
            
            if (value.name.toLowerCase().includes(searchLower)) {
                relevanceScore += 10;
                matchReasons.push('name');
            }
            
            if (value.description.toLowerCase().includes(searchLower)) {
                relevanceScore += 8;
                matchReasons.push('description');
            }
            
            if (value.category.toLowerCase().includes(searchLower)) {
                relevanceScore += 6;
                matchReasons.push('category');
            }
            
            if (value.tags && value.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
                relevanceScore += 5;
                matchReasons.push('tags');
            }
            
            if (value.message.title.toLowerCase().includes(searchLower)) {
                relevanceScore += 4;
                matchReasons.push('title');
            }
            
            if (value.message.description.toLowerCase().includes(searchLower)) {
                relevanceScore += 3;
                matchReasons.push('content');
            }
            
            if (value.message.fields.some(field => 
                field.name.toLowerCase().includes(searchLower) || 
                field.value.toLowerCase().includes(searchLower)
            )) {
                relevanceScore += 2;
                matchReasons.push('fields');
            }
            
            if (relevanceScore > 0) {
                searchResults.push({
                    key,
                    value,
                    relevanceScore,
                    matchReasons
                });
            }
        });
        
        searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        filteredEntries = searchResults.map(result => [result.key, result.value]);
    }
    
    if (filteredEntries.length === 0) {
        const noResultsEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle('🔍 No Results Found')
            .setDescription(`No entries found matching "${searchTerm}". Try different keywords like:\n• help, support, guide\n• technical, account, billing\n• api, getting started`)
            .addFields({
                name: '💡 Search Tips',
                value: '• Try broader terms\n• Check spelling\n• Use synonyms\n• Search for specific topics',
                inline: false
            })
            .setTimestamp();
            
        await interaction.reply({ 
            embeds: [noResultsEmbed], 
            flags: MessageFlags.Ephemeral 
        });
        return;
    }
    
    const limitedEntries = filteredEntries.slice(0, 25);
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('db_select')
        .setPlaceholder('🔍 Choose an option to view details...')
        .setMinValues(1)
        .setMaxValues(1);

    limitedEntries.forEach(([key, value]) => {
        selectMenu.addOptions({
            label: value.name,
            value: key,
            description: value.description.length > 100 ? 
                value.description.substring(0, 97) + '...' : 
                value.description,
            emoji: value.emoji
        });
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    const mainEmbed = new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setTitle('📋 Database Search Results')
        .setTimestamp()
        .setFooter({ text: 'Select from the dropdown menu below' });
    
    if (searchTerm) {
        mainEmbed.setDescription(`🔍 **Search Query:** "${searchTerm}"\n📊 **Results Found:** ${filteredEntries.length}${filteredEntries.length > 25 ? ' (showing first 25)' : ''}`);
        
        if (searchResults.length > 0) {
            const topResults = searchResults.slice(0, 3).map((result, index) => {
                const matchInfo = result.matchReasons.join(', ');
                // return `${index + 1}. **${result.value.name}** (matched: ${matchInfo})`;
                return `${index + 1}. **${result.value.name}**`;
            }).join('\n');
            
            mainEmbed.addFields({
                name: '🎯 Top Matches',
                value: topResults,
                inline: false
            });
        }
    } else {
        mainEmbed.setDescription('Select an option below to view detailed information');
        mainEmbed.addFields({
            name: '📊 Available Options',
            value: `${Object.keys(database).length} entries available`,
            inline: true
        });
    }

    await interaction.reply({
        embeds: [mainEmbed],
        components: [row]
    });
}

async function handleDbSelection(interaction) {
    const selectedOption = interaction.values[0];
    const dbEntry = database[selectedOption];

    if (!dbEntry) {
        const errorEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ Option Not Found')
            .setDescription('Sorry, that option is no longer available.')
            .setTimestamp();
            
        await interaction.reply({ 
            embeds: [errorEmbed], 
            flags: MessageFlags.Ephemeral 
        });
        return;
    }

    const responseEmbed = new EmbedBuilder()
        .setColor(dbEntry.color)
        .setTitle(dbEntry.message.title)
        .setDescription(dbEntry.message.description)
        .addFields(dbEntry.message.fields)
        .setTimestamp()
        .setFooter({ text: dbEntry.message.footer });

    responseEmbed.setAuthor({ 
        name: dbEntry.category,
        iconURL: interaction.client.user.displayAvatarURL()
    });

    await interaction.reply({
        embeds: [responseEmbed]
    });
    
    console.log(`📊 Database query: ${interaction.user.tag} accessed "${dbEntry.name}"`);
}

client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('🔄 Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});


client.login(process.env.DISCORD_TOKEN);

module.exports = { client, database };
