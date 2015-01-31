function store(key, value) {
  localStorage[key] = JSON.stringify(value);
}

function read(key) {
  try {
    return JSON.parse(localStorage[key]);
  } catch (e) {}
}

var RL = {
  CC_MAPPINGS: read('userMappings') || defaultMappings()
};

function pageInfo(pages) {
  var count = 0;

  return pages.map(function(tracks) {
    return {
      tracks: tracks.map(function(track) {
        return {
          controls: track.map(function(control) {
            control.track = Math.floor(count / 13);
            control.offset = count++;
            control.isEnabled = !!control.isEnabled;

            return control;
          })
        };
      })
    };
  });
}

var $ = new Ractive({
  el: 'application',
  template: '#layout',
  data: {
    pages: pageInfo(RL.CC_MAPPINGS),

    selectedPage: 0,
    selectedControl: null,

    activePage: function(page) {
      return page === this.get('selectedPage');
    },

    activeControl: function(control) {
      var classes = [];

      if (control.offset === this.get('selectedControl.offset')) {
        classes.push('active');
      }

      if (control.isEnabled) {
        classes.push('enabled');
      }

      return classes.join(' ');
    }
  }
});

$.on({
  setPage: function(e) {
    $.set('selectedPage', +e.node.value);
    $.set('selectedControl', null);
  },
  setControl: function(e) {
    $.set('selectedControl', e.context.controls[+e.node.value]);
  },
  toggleControl: function() {
    $.set('selectedControl.isEnabled', !$.get('selectedControl.isEnabled'));
    $.update('pages.' + $.get('selectedPage'));
  },
  resetConfiguration: function() {
    localStorage.clear();
    location.reload();
  }
});

$.observe({
  pages: function() {
    store('userMappings', RL.CC_MAPPINGS);
  }
});
