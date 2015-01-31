var RL = {
  CC_MAPPINGS: defaultMappings()
};

function pageInfo(pages) {
  return pages.map(function(tracks) {
    return {
      tracks: tracks.map(function(track) {
        track.isEnabled = false;

        return track;
      }),
      isActive: false
    };
  });
}

var $ = new Ractive({
  el: 'application',
  template: '#layout',
  twoway: false,
  data: {
    pages: pageInfo(RL.CC_MAPPINGS),

    selectedPage: 0,
    selectedTrack: 0,
    selectedControl: 0,

    activePage: function(page) {
      return page === this.get('selectedPage');
    }
  }
});

$.on({
  setPage: function(e) {
    this.set('selectedPage', +e.node.value);
  },
  setControl: function(e) {
    var page = this.get('selectedPage'),
        track = this.get('selectedTrack'),
        control = +e.node.value;

    this.set('selectedControl', RL.CC_MAPPINGS[page][track][control]);
  }
});
