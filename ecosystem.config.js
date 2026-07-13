module.exports = {
  apps: [
    {
      name: "wbstories",

      script: "node",
      args: "--env-file=.env.local ./node_modules/next/dist/bin/next start",

      cwd: "D:/zaploom_projects/wbstories",

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 4081,
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};