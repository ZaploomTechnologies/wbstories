module.exports = {
  apps: [
    {
      name: "wbstories_admin",

      script: "./node_modules/next/dist/bin/next",
      args: "start",

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
