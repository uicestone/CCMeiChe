/**
 * OneAPM agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['CCMeiChe'],
  /**
   * Your OneAPM license key.
   */
  license_key : 'CwUBFFlHVFl8748NWBZaCEoEAw7285gPBAkFAA4FUa6c6wFRGlVSBAQJdf57DgIKAQIKAlM=',
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to OneAPM when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'info'
  }
};
