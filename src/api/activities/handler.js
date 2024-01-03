class ActivitiesHandler {
  constructor(service) {
    this._service = service;
  }

  getActivitiesHandler = async (request) => {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const activities = await this._service.getActivities(playlistId, credentialId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  };
}

module.exports = ActivitiesHandler;
