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
        
        // Extract pattern-specific options from copyOptions
        const { context, to, from, ...validPluginOptions } = copyOptions;
        
        // Normalize patterns for new API and apply pattern-specific options
        const normalizedPatterns = patterns.map(pattern => {
            if (typeof pattern === 'string') {
                const patternObj = { from: pattern };
                
                // Apply copyOptions to pattern if not already specified
                if (context && !patternObj.context) patternObj.context = context;
                if (to && !patternObj.to) patternObj.to = to;
                
                return patternObj;
            } else {
                // If pattern is already an object, merge with copyOptions
                const patternObj = { ...pattern };
                
                if (context && !patternObj.context) patternObj.context = context;
                if (to && !patternObj.to) patternObj.to = to;
                
                return patternObj;
            }
        });
        
        imageminOptions = Object.assign({
            test: /\.(jpe?g|png|gif|svg)$/i,
        }, imageminOptions);
    
        this.tasks = this.tasks || [];
    
        // Use new API format - options should only contain valid plugin-level options
        // For copy-webpack-plugin v12, valid options are: { concurrency }
        this.tasks.push( new CopyWebpackPlugin({ 
            patterns: normalizedPatterns,
            options: validPluginOptions  // Should only contain concurrency or be empty
        }) );
        this.tasks.push( new ImageminPlugin(imageminOptions) );
        this.tasks.push( new ManifestPlugin(normalizedPatterns) );
    }

    webpackPlugins() {
        return this.tasks;
    }
}

module.exports = Imagemin;
