// Inject required permission to perform the action.
// Then 'canAct' middleware can check if the user has the required permission.

/**
 *
 * @param {*} action This action is equivalent to the permission name in the permission table
 * @returns {}
 */
module.exports = (action) => (req, res, next) => {
  req.action = action;
  next();
};
