

## How to Add an External Linux Server as a GitLab Runner

### Prerequisites
- A Linux server (Ubuntu, CentOS, etc.) with root or sudo access
- Docker installed (optional, but recommended for Docker runners)
- Access to your GitLab project or group with Maintainer permissions

### Steps

1. **Install GitLab Runner on your server**

   ```bash
   # For Debian/Ubuntu
   curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
   sudo apt-get install gitlab-runner -y
   
   # For CentOS/RHEL
   curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
   sudo yum install gitlab-runner -y
   ```

2. **Get your GitLab registration token**
   - Go to your GitLab project: `Settings` > `CI / CD` > `Runners` > `Expand`
   - Copy the registration token under "Set up a specific Runner manually"

3. **Register the runner**

   ```bash
   sudo gitlab-runner register
   ```
   - Enter your GitLab instance URL (e.g., `https://gitlab.com`)
   - Enter the registration token you copied
   - Enter a description for the runner (e.g., `my-linux-runner`)
   - Enter tags (optional, comma-separated)
   - Enter the executor type (e.g., `shell`, `docker`, etc.)
   - For Docker executor, specify the default image (e.g., `alpine:latest`)

4. **Start the runner**

   ```bash
   sudo gitlab-runner start
   ```

5. **Verify the runner is active**
   - Go to your GitLab project: `Settings` > `CI / CD` > `Runners`
   - You should see your new runner listed as active

### Notes
- You can register the runner for a specific project or for a whole group.
- For more advanced configuration, edit `/etc/gitlab-runner/config.toml` on your server.
- For Docker-based jobs, ensure Docker is installed and the runner user is in the `docker` group.

--- 