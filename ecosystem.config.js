module.exports = {
  apps: [
    {
      name: "wbstories",

      script: "./node_modules/next/dist/bin/next",
      args: "start",

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