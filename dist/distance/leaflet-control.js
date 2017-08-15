// Generated by CoffeeScript 1.3.1
(function() {
  var DistanceControl, DistancePath, DistancePopup,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DistancePopup = L.Popup.extend({
    _close: function() {
      return null;
    }
  });

  DistancePath = (function() {

    DistancePath.name = 'DistancePath';

    function DistancePath(map, control) {
      var _this = this;
      this.map = map;
      this.control = control;
      this.onEdited = __bind(this.onEdited, this);

      this.onMapClick = __bind(this.onMapClick, this);

      this.remove = __bind(this.remove, this);

      this.passivate = __bind(this.passivate, this);

      this.activate = __bind(this.activate, this);

      this.active = false;
      this.poly = new L.Polyline([]);
      this.poly.on('dblclick', this.remove);
      this.poly.on('click', function() {
        if (_this.active) {
          return _this.passivate();
        } else {
          return _this.activate();
        }
      });
      this.poly.on('edit', this.onEdited);
      this.map.addLayer(this.poly);
    }

    DistancePath.prototype.activate = function() {
      this.active = true;
      if (this.poly.editing != null) {
        this.poly.editing.enable();
      }
      this.poly.setStyle(this.control.options.activeStyle);
      this.map.on('click', this.onMapClick);
      return this.control.activate(this);
    };

    DistancePath.prototype.passivate = function() {
      var _ref;
      this.active = false;
      if (((_ref = this.poly) != null ? _ref.editing : void 0) != null) {
        this.poly.editing.disable();
      }
      this.poly.setStyle(this.control.options.passiveStyle);
      this.map.off('click', this.onMapClick);
      return this.control.passivate();
    };

    DistancePath.prototype.remove = function() {
      this.passivate();
      this.map.removeLayer(this.poly);
      if (this.popup) {
        return this.map.removeLayer(this.popup);
      }
    };

    DistancePath.prototype.onMapClick = function(e) {
      this.poly.addLatLng(e.latlng);
      if (!this.popup) {
        this.popup = new DistancePopup();
        this.popup.setLatLng(e.latlng);
        this.map.addLayer(this.popup);
      }
      if (this.poly.editing != null) {
        this.poly.editing.disable();
        this.poly.editing.enable();
        this.poly.fire('edit');
      }
      return this.onEdited();
    };

    DistancePath.prototype.onEdited = function() {
      var points;
      points = this.poly.getLatLngs();
      this.popup.setContent(this.formatDistance(this.calculateDistance(points)));
      return this.popup.setLatLng(points[points.length - 1]);
    };

    DistancePath.prototype.calculateDistance = function(points) {
      var i, len, _i, _ref;
      len = 0;
      if (points.length > 1) {
        for (i = _i = 1, _ref = points.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          len += points[i - 1].distanceTo(points[i]);
        }
      }
      return len;
    };

    DistancePath.prototype.formatDistance = function(dist) {
      if (dist > 2000) {
        return Math.round(dist / 100) / 10 + " km";
      } else if (dist > 5) {
        return Math.round(dist) + " m";
      } else {
        return dist + " m";
      }
    };

    return DistancePath;

  })();

  DistanceControl = (function() {

    DistanceControl.name = 'DistanceControl';

    function DistanceControl(map, options) {
      this.map = map;
      this.options = options;
      this.toggleMeasure = __bind(this.toggleMeasure, this);

      this.map = map;
      this.container = L.DomUtil.create('div', 'leaflet-control-distance');
      this.link = L.DomUtil.create('a', '', this.container);
      this.link.href = '#';
      this.link.title = "Start measuring distance";
      L.DomEvent.addListener(this.link, 'click', L.DomEvent.stopPropagation);
      L.DomEvent.addListener(this.link, 'click', L.DomEvent.preventDefault);
      L.DomEvent.addListener(this.link, 'click', this.toggleMeasure);
    }

    DistanceControl.prototype.toggleMeasure = function() {
      if (this.path) {
        return this.path.passivate();
      } else {
        return new DistancePath(this.map, this).activate();
      }
    };

    DistanceControl.prototype.activate = function(path) {
      if (this.path && this.path !== path) {
        this.path.passivate();
      }
      L.DomUtil.addClass(this.link, 'active');
      return this.path = path;
    };

    DistanceControl.prototype.passivate = function() {
      L.DomUtil.removeClass(this.link, 'active');
      return this.path = null;
    };

    return DistanceControl;

  })();

  this.L.Control.Distance = this.L.Control.extend({
    options: {
      position: 'topleft',
      activeStyle: {
        color: 'red'
      },
      passiveStyle: {
        color: 'blue'
      }
    },
    onAdd: function(map) {
      return new DistanceControl(map, this.options).container;
    }
  });

}).call(this);
