const routes = (handler) => [
  {
    method: 'POST',
    path: `/${handler.name}`,
    handler: (request, h) => handler.postItemHandler(request, h),
  },
  {
    method: 'GET',
    path: `/${handler.name}`,
    handler: (request, h) => handler.getItemsHandler(request, h),
  },
  {
    method: 'GET',
    path: `/${handler.name}/{id}`,
    handler: (request, h) => handler.getItemByIdHandler(request, h),
  },
  {
    method: 'PUT',
    path: `/${handler.name}/{id}`,
    handler: (request, h) => handler.putItemByIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: `/${handler.name}/{id}`,
    handler: (request, h) => handler.deleteItemByIdHandler(request, h),
  },
];

module.exports = routes;
