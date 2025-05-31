<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - Microsoft 365 Message Center</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          :root {
            --primary-color: #1a73e8;
            --primary-light: #e8f0fe;
            --text-color: #202124;
            --text-secondary: #5f6368;
            --border-color: #dadce0;
            --hover-bg: #f8f9fa;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: var(--text-color);
            line-height: 1.5;
            background: #f5f5f5;
            padding: 2rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 2rem;
          }

          header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          h1 {
            color: var(--primary-color);
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .description {
            color: var(--text-secondary);
            font-size: 1rem;
          }

          .stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .stat-card {
            background: var(--primary-light);
            color: var(--primary-color);
            padding: 1rem;
            border-radius: 8px;
            flex: 1;
            min-width: 200px;
            text-align: center;
          }

          .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          th {
            background: var(--primary-color);
            color: white;
            font-weight: 500;
            text-align: left;
            padding: 1rem;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.875rem;
          }

          tr:hover {
            background: var(--hover-bg);
          }

          a {
            color: var(--primary-color);
            text-decoration: none;
            word-break: break-all;
          }

          a:hover {
            text-decoration: underline;
          }

          .priority {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .priority-high {
            background: #e6f4ea;
            color: #137333;
          }

          .priority-medium {
            background: #fef7e0;
            color: #b06000;
          }

          .priority-low {
            background: #e8f0fe;
            color: #1a73e8;
          }

          .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 0.875rem;
            text-align: center;
          }

          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }

            .container {
              padding: 1rem;
            }

            table {
              display: block;
              overflow-x: auto;
            }

            th, td {
              white-space: nowrap;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Microsoft 365 Message Center Sitemap</h1>
            <p class="description">A complete list of all pages and messages in our system</p>
          </header>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </div>
              <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority='1.0'])"/>
              </div>
              <div class="stat-label">High Priority Pages</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:changefreq='daily'])"/>
              </div>
              <div class="stat-label">Daily Updated Pages</div>
            </div>
          </div>

          <table>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Frequency</th>
              <th>Priority</th>
            </tr>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:changefreq"/>
                </td>
                <td>
                  <span class="priority priority-{if (sitemap:priority >= '0.8') then 'high' else if (sitemap:priority >= '0.5') then 'medium' else 'low'}">
                    <xsl:value-of select="sitemap:priority"/>
                  </span>
                </td>
              </tr>
            </xsl:for-each>
          </table>

          <div class="footer">
            <p>This sitemap was automatically generated for Microsoft 365 Message Center</p>
            <p>Last generated: <xsl:value-of select="current-dateTime()"/></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 