import { getContext } from "../../../extensions.js";

// Configuration
const LOOKBACK_DEPTH = 10; // How many messages back to search
const TARGET_VAR_KEY = 'stat_data'; // The key inside the variables object to look for
const extensionName = "MVU-Stat-Macro";

/**
 * Helper to traverse nested objects using dot notation (e.g. "Lian.Moral")
 * @param {object} obj - The object to search in
 * @param {string} path - The dot-separated path string
 * @returns {any|undefined} - The value if found, or undefined
 */
function resolvePropertyPath(obj, path) {
    if (!obj || !path) return undefined;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }

    return current;
}

/**
 * Retrieves a stat value from chat history.
 * @param {string} variableName - The variable name to look for.
 * @param {number|null} targetIndex - Optional specific message index. Supports negative indexing (-1 = last).
 */
function getStatValue(variableName, targetIndex = null) {
    const context = getContext();
    const chat = context.chat;

    if (!chat || !Array.isArray(chat) || chat.length === 0) {
        return '';
    }

    // Helper to check a specific message index
    const checkMessage = (index) => {
        if (index < 0 || index >= chat.length) return null;

        const msg = chat[index];
        if (!msg.variables || !Array.isArray(msg.variables)) return null;

        const swipeId = msg.swipe_id ?? 0;
        const swipeVariables = msg.variables[swipeId];
        if (!swipeVariables) return null;

        const statData = swipeVariables[TARGET_VAR_KEY];
        if (!statData) return null;

        // Use helper to support nested paths like "Lian.Moral"
        const rawValue = resolvePropertyPath(statData, variableName);

        if (rawValue !== undefined) {
            // Format handling
            if (Array.isArray(rawValue) && rawValue.length >= 1) {
                return String(rawValue[0]);
            }
            return String(rawValue);
        }
        return null;
    };

    // Case 1: Specific Index Requested
    if (targetIndex !== null) {
        // Handle negative indexing
        let realIndex = targetIndex;
        if (realIndex < 0) {
            realIndex = chat.length + realIndex;
        }

        const result = checkMessage(realIndex);
        return result !== null ? result : '';
    }

    // Case 2: Auto-scan (Backwards from latest)
    const startIndex = chat.length - 1;
    const endIndex = Math.max(0, chat.length - LOOKBACK_DEPTH);

    for (let i = startIndex; i >= endIndex; i--) {
        const result = checkMessage(i);
        if (result !== null) {
            return result;
        }
    }

    return '';
}

function registerMacros() {
    // Access the global SillyTavern context or the one imported
    const context = getContext();

    if (!context.macros) {
        console.error(`[${extensionName}] Macro system not found. Is SillyTavern updated?`);
        return;
    }

    context.macros.register('get_mvu_stat', {
        description: 'Retrieves a value from stat_data in chat history. Supports nested keys (dot notation) and auto-scan.',
        unnamedArgs: [
            {
                name: 'variable_name',
                description: 'The name of the variable (e.g. "Lian.Moral").',
                type: 'string',
            },
            {
                name: 'message_index',
                description: 'Optional. Specific message index to check.',
                type: 'integer',
                optional: true,
            }
        ],
        returns: 'The variable value or empty string if not found.',
        exampleUsage: [
            '{{get_mvu_stat::Lian.Moral}}',
            '{{get_mvu_stat::Lian.Love::-1}}'
        ],
        handler: (ctx) => {
            const [variableName, messageIndexAttr] = ctx.unnamedArgs;

            if (!variableName) return '';

            let targetIndex = null;
            if (messageIndexAttr !== undefined && messageIndexAttr !== '') {
                const parsed = parseInt(messageIndexAttr, 10);
                if (!isNaN(parsed)) {
                    targetIndex = parsed;
                }
            }

            return getStatValue(variableName, targetIndex);
        }
    });

    console.log(`[${extensionName}] Macro {{get_mvu_stat}} registered successfully.`);
}

// Hook into extension loading
jQuery(async () => {
    registerMacros();
    console.log('extension [' + extensionName + '] loaded.');
});
