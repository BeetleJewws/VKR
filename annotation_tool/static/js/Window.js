class Window {

  constructor(body, id, WindowsController) {
    this.id = id;
    this.body = body;
    this.saved_item = {}
    this.WC = WindowsController;
    this.node = null;
  }

  draw(container) {
    var self = this;

    $(container).append(this.body);
    console.log('drawing: in', container);
    var window = document.getElementById(self.id);
    console.log('window is created', window);
    self.node = window;


    this.makeDraggable();
    this.makePlaceholdersDraggable($(window).find('.placeholder'));
    this.makeItemsDraggable($(window).find('.item'));

    var titles = $(this.node).find('.title');
    $(titles).each(function () {
      var title = this;
      $(this).tipso({
        background: '#232d41',
        speed: 1,
        width: "350px",
        animationIn: 'fadeInDown',
        animationOut: 'fadeOutUp',
        position: 'top',
        useTitle: false,
        tooltipHover: true,
        content: function () {
          return '<div class="dep-input"><input type="text" size="40"><div class="add-dep" data-placeholder-role="' + $(title).data('role') + '" data-window-pk="' + self.id + '"><p><i class="fas fa-plus"></i></p></div></div>';
        }
      });
    })

  }

  hide() {
    this.width = $(this.node).width();
    this.height = $(this.node).height();
    $(this.node).animate({
      opacity: 0,
      height: "toggle",
      width: 'toggle',
    }, 500, function () {
    });
  }
  show() {
    var self = this;
    $(this.node).css('display', 'block');
    $(this.node).animate({
      opacity: 1,
      height: self.height,
      width: self.width,
    }, 500, function () {
    });
  }
  close() {
    this.WC.windows[this.id] = undefined;
    $(this.node).remove();
  }

  save() {
    var self = this;
    var slaves = {};
    var masters = {};
    var temp = $(self.node).find('.item-current');
    var item_node = $(temp).next();
    var model = $(item_node).data('model');
    var pk = $(item_node).data('pk');
    console.log(temp, item_node);
    var placeholders = $(self.node).find('.placeholder');
    $(placeholders).each(function () {
      var dep_name = $(this).data('dep-name');
      var dep_role = $(this).data('dep-role');

      var result = [];
      var items = $(this).find('.item');
      $(items).each(function () {
        var model = $(this).data('model');
        var pk = $(this).data('pk');
        result.push([model, pk]);
      })
      if (dep_role === 'slaves') { slaves[dep_name] = result; }
      if (dep_role === 'masters') { masters[dep_name] = result; }
    })
    var data = {
      slaves: JSON.stringify(slaves),
      masters: JSON.stringify(masters),
      model: model,
      pk: pk,
    };
    console.log(data)
    $.ajax({
      type: "POST",
      url: "/annotation_tool/saveWindow",
      data: data,
      async: false,
      success: function () {
        alert('Окно сохранено!');
      },
      error: function (jqXhr, textStatus, errorThrown) {
        console.log('Связь НЕ создана!', textStatus);
      }
    });

  }

  deleteItem(item) {
    var self = this;
    self.saved_item['item'] = item;
    self.saved_item['dep-name'] = $(item).closest('.placeholder').data('dep-name');
    self.saved_item['dep-role'] = $(item).closest('.placeholder').data('dep-role');
    $(this.node).find('.item-restore').css('opacity', '1');
    $(item).remove();
  }
  restoreItem() {
    var self = this;
    if (Object.keys(self.saved_item).length) {
      var dep_name = self.saved_item['dep-name'];
      var dep_role = self.saved_item['dep-role'];
      var placeholder = $(this.node).find(".placeholder[data-dep-name$='" + dep_name + "'][data-dep-role$='" + dep_role + "']");
      // $(placeholder).append(self.saved_item['item']);
      // this.makeItemsDraggable([self.saved_item['item']]);
      self.addItem(placeholder, self.saved_item['item']);
      self.saved_item = {};
      $(this.node).find('.item-restore').css('opacity', '0');
    }
  }


  makeItemsDraggable(nodes) {
    $(nodes).draggable({
      cursor: 'move',
      helper: "clone",
      appendTo: "body",
      zIndex: 1000,
      connectToSortable: ".placeholder",
      revert: "true",
      start: function (event, ui) {
        $(ui.helper).find('div').animate({
          opacity: "0"
        }, 200, function () {
          // Animation complete.
        });
      },
      stop: function (event, ui) {
        $(ui.helper).find('div').animate({
          opacity: "1"
        }, 200, function () {
          // Animation complete.
        });
      }
    });
    $(nodes).each(function (i) {
      $(this).attr('id', guidGenerator());
    });
  }
  // makeItemsDraggable(nodes) {
  //   $(nodes).draggable({
  //     cursor: 'move',
  //     helper: "clone",
  //     appendTo: "body",
  //     zIndex: 1000,
  //     start: function (event, ui) {
  //       $(ui.helper).animate({
  //         width: "30px"
  //       }, 200, function () {
  //         // Animation complete.
  //       });
  //       $(ui.helper).find('div').animate({
  //         opacity: "0"
  //       }, 200, function () {
  //         // Animation complete.
  //       });
  //       $(ui.helper).find('p').animate({
  //         opacity: "0"
  //       }, 200, function () {
  //         // Animation complete.
  //       });
  //     }
  //   });
  //   $(nodes).each(function (i) {
  //     $(this).attr('id', guidGenerator());
  //   });
  // }



  makeDraggable() {
    dragElement(document.getElementById(this.id))
  }

  addItem(placeholder, item) {
    console.log('addingItem', self.id);
    self = this;
    $(placeholder).append(item);
    self.registerItem(placeholder, item)
  }

  addPlaceholder(name, role) {
    var self = this;
    var html = '';
    html += '<div class="item-dep"> <p>' + name + ':</p>'
    html += '<div class ="placeholder"  data-dep-name="' + name + '" data-dep-role="' + role + '">'
    var title = $(self.node).find(".title[data-role$='" + role + "']");
    var dep_container = $(title).next();
    $(dep_container).append(html);

    var placeholder = $(self.node).find(".placeholder[data-dep-name$='" + name + "'][data-dep-role$='" + role + "']");
    self.makePlaceholdersDraggable(placeholder);

  }

  registerItem(placeholder, item) {
    var self = this;
    console.log('registering');
    item.id = guidGenerator();
    var pk = $(item).data('pk');
    var model = $(item).data('model');
    if (('window' + pk + model) == self.id) {
      console.log('test1')
      $(item).remove();
    }
    else if ($(placeholder).find("div[data-pk$='" + pk + "'][data-model$='" + model + "']").length > 1) {
      console.log($(placeholder).find("div[data-pk$='" + pk + "'][data-model$='" + model + "']").length)
      $(item).remove();
    }
    else { self.makeItemsDraggable([item]) }
  }

  makePlaceholdersDraggable(nodes) {
    var win = this;
    $(nodes).sortable({
      helper: "clone",
      revert: true,
      update: function (event, ui) {
        var item = ui.item;
        $(item).attr('style', '');
        win.registerItem(this, item);
      }
    });
    //     $(nodes).sortable({ revert: true });
    $(nodes).disableSelection();
  }
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    // $("[id^='window']").css("z-index", "1");
    // $(elmnt).css("z-index", "99");

    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}