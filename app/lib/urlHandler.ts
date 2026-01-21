export function parseTabbyURL(url: string): any {
    try {
        const urlInstance = new URL(url)

        if (urlInstance.protocol !== 'tabby:') {
            return null
        }

        // The "host" or first path part is the command
        const command = urlInstance.host || urlInstance.pathname.replace(/^\/+/, '')
        if (!command) {
            return null
        }

        // Initialize with the command as the first element of "_"
        // This matches how yargs represents commands.
        const argv: any = {
            _: [command],
        }

        // Map all query parameters directly to the argv object.
        // This ensures that all params (?profileName=xxx, ?providerId=ssh, etc.)
        // reach the renderer exactly as expected by the CLI handlers.
        for (const [key, value] of urlInstance.searchParams.entries()) {
            if (value === 'true' || value === '') {
                argv[key] = true
            } else if (value === 'false') {
                argv[key] = false
            } else if (/^\d+$/.test(value)) {
                argv[key] = parseInt(value, 10)
            } else {
                argv[key] = value
            }
        }

        // Special handling for the 'run' command:
        // CLI expects 'command' to be an array of strings.
        if (command === 'run' && typeof argv.command === 'string') {
            argv.command = argv.command.split(' ')
        }

        console.log(`URL Handler - Safely parsed [${url}] to:`, JSON.stringify(argv))
        return argv
    } catch (e) {
        console.error('Failed to parse tabby:// URL:', e)
        return null
    }
}
