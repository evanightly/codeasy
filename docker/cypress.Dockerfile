# Cypress Docker container with VNC support and browsers
FROM cypress/included:14.5.0

# Install VNC, desktop environment, and additional tools
RUN apt-get update && apt-get install -y \
    xvfb \
    tigervnc-standalone-server \
    tigervnc-common \
    fluxbox \
    wmctrl \
    wget \
    curl \
    firefox-esr \
    xfce4-terminal \
    python3 \
    python3-pip \
    websockify \
    && rm -rf /var/lib/apt/lists/*

# Install noVNC for web-based VNC access
RUN mkdir -p /opt/noVNC && \
    wget -qO- https://github.com/novnc/noVNC/archive/v1.4.0.tar.gz | tar xz --strip 1 -C /opt/noVNC

# Create VNC password directory and set password
RUN mkdir -p /root/.vnc && \
    echo "secret" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd

# Copy VNC startup script
COPY docker/scripts/start-cypress-vnc.sh /start-cypress-vnc.sh
RUN chmod +x /start-cypress-vnc.sh

# Set working directory
WORKDIR /e2e

# Create necessary directories
RUN mkdir -p /e2e/cypress/logs \
    && mkdir -p /e2e/cypress/screenshots \
    && mkdir -p /e2e/cypress/videos \
    && mkdir -p /e2e/cypress/downloads

# Set environment variables
ENV DISPLAY=:99
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
ENV NODE_ENV=development

# Expose VNC port, noVNC web port, and Cypress dashboard port
EXPOSE 5900 6080 8080

# Use our custom start script
ENTRYPOINT ["/start-cypress-vnc.sh"]
