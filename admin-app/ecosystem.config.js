module.exports = {
  apps: [
    {
      name: "wbstories_admin",

      script: "node",
      args: "--env-file=.env.local ./node_modules/next/dist/bin/next start",

      cwd: "D:/zaploom_projects/wbstories/admin-app",

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 4080,
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
