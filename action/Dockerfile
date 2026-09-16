# Dockerfile for Perfectable GitHub Action
FROM node:20-alpine

# Install Perfectable skill globally
RUN npm install -g perfectable@${INSTALL_VERSION:-latest}

# Set working directory
WORKDIR /github/workspace

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]