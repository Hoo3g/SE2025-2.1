module.exports = {
    apps: [{
        name: 'oauth-server',
        script: 'npm',
        args: 'run dev',
        cwd: process.cwd(), // Auto-detect current directory
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        time: true
    }]
};
