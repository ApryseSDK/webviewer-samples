({
  update: function (component, event, helper) {
    var loc = event.getParam("token");
    component.set("v.showViewer", false);
  }
});
