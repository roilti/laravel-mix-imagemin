const ManifestPlugin = require('./ManifestPlugin.js');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');

class Imagemin {
    name() {
        return ['imagemin', 'images', 'img'];
    }

    dependencies() {
        this.requiresReload = `
            Imagemin's required plugins have been installed.
            Please run "npm run dev" again.
        `;

        return ['copy-webpack-plugin', 'imagemin-webpack-plugin'];
    }

    register(patterns, copyOptions = {}, imageminOptions = {}) {
        patterns = [].concat(patterns);
        
        // Extract context from copyOptions since it's no longer valid at the plugin level
        const context = copyOptions.context;
        delete copyOptions.context; // Remove from copyOptions
        
        // Normalize patterns for new API and apply context to each pattern
        const normalizedPatterns = patterns.map(pattern => {
            if (typeof pattern === 'string') {
                return { 
                    from: pattern,
                    ...(context && { context: context })
                };
            } else {
                // If pattern is already an object, add context if not already specified
                return {
                    ...pattern,
                    ...(context && !pattern.context && { context: context })
                };
            }
        });
        
        imageminOptions = Object.assign({
            test: /\.(jpe?g|png|gif|svg)$/i,
        }, imageminOptions);
    
        this.tasks = this.tasks || [];
    
        // Use new API format - options should only contain valid plugin options
        this.tasks.push( new CopyWebpackPlugin({ 
            patterns: normalizedPatterns,
            options: copyOptions  // This should now be clean of context
        }) );
        this.tasks.push( new ImageminPlugin(imageminOptions) );
        this.tasks.push( new ManifestPlugin(normalizedPatterns) );
    }

    webpackPlugins() {
        return this.tasks;
    }
}

module.exports = Imagemin;
