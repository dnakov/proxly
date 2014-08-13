var presenter = {
        name: 'Daniel Nakov',
        company: 'Technical Architect<br>Silverline',
        twitter: '@dnak0v',
        github: 'http://github.com/dnakov'
      };

var SLIDE_CONFIG = {
  // Slide settings
  settings: {
    title: 'Speed up your force.com development and go localhost',
    subtitle: '',
    useBuilds: true, // Default: true. False will turn off slide animation builds.
    usePrettify: true, // Default: true
    enableSlideAreas: true, // Default: true. False turns off the click areas on either slide of the slides.
    enableTouch: true, // Default: true. If touch support should enabled. Note: the device must support touch.
    //analytics: 'UA-XXXXXXXX-1', // TODO: Using this breaks GA for some reason (probably requirejs). Update your tracking code in template.html instead.
    favIcon: 'favicon.ico',
    fonts: [
      'Open Sans:regular,semibold,italic,italicsemibold',
      'Source Code Pro'
    ],
    presenter:presenter
    //theme: ['mytheme'], // Add your own custom themes or styles in /theme/css. Leave off the .css extension.
  },

  // Author information

  presenters: [presenter]
};

