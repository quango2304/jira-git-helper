# Jira Git Helper

A Chrome extension that helps streamline your workflow between Jira and Git by providing quick copy functions for ticket information, branch names, and commit messages.

## Features

- **Copy Ticket Info**: Quickly copy Jira ticket information in a formatted string (ticket code, title, and URL)
- **Generate Branch Names**: Automatically generate and copy Git branch names with prefixes:
  - `bugfix/TICKET-XXX-description`
  - `feature/TICKET-XXX-description`
  - `technical/TICKET-XXX-description`
- **Generate Commit Messages**: Create standardized commit messages with prefixes:
  - `[TICKET-XXX][bugfix] Description`
  - `[TICKET-XXX][feature] Description`
  - `[TICKET-XXX][technical] Description`
- **GitHub PR Support**: Copy PR information in a formatted string (title and URL)

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to a Jira ticket or GitHub PR page
2. Click the extension icon in your browser toolbar
3. Select the desired copy option:
   - Use "Copy Info" to copy the ticket/PR details
   - Use "Copy Branch" buttons to copy generated branch names
   - Use "Copy Commit" buttons to copy formatted commit messages

## Supported Pages

- Jira ticket pages (URLs containing `atlassian.net/browse/`)
- GitHub Pull Request pages (URLs containing `github.com` and `/pull/`)


## Contributing

Feel free to open issues or submit pull requests to improve the extension, or add support other platforms.
