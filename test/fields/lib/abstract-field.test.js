'use strict';

const AbstractField = Restypie.Fields.AbstractField;
const PermissionTypes = Restypie.PermissionTypes;


describe('Restypie.Fields.AbstractField', function () {

  class Field extends AbstractField {};

  describe('constructor', function () {

    it('should set isRequired to true if isWritableOnce', function () {
      const field = new Field('key', { isWritableOnce: true });
      field.isWritableOnce.should.equal(true);
      field.isRequired.should.equal(true);
    });

    it('should NOT set isRequired to true if isWritableOnce and isRequired is provided', function () {
      const field = new Field('key', { isWritableOnce: true, isRequired: false });
      field.isWritableOnce.should.equal(true);
      field.isRequired.should.equal(false);
    });

    it('should set isPopulable', function () {
      const field = new Field('key', { isPopulable: true });
      field.isPopulable.should.equal(true);
    });

  });

  describe('authentication', function () {

    class ReadOnlyField extends AbstractField {
      canWriteOnCreate(bundle) {
        return Promise.resolve(false);
      }

      canWriteOnUpdate(bundle) {
        return Promise.resolve(false);
      }
    }

    class AdminWritableField extends AbstractField {
      canWriteOnCreate(bundle) {
        return Promise.resolve(bundle.account_type === 'admin');
      }

      canWriteOnUpdate(bundle) {
        return Promise.resolve(bundle.account_type === 'admin');
      }
    }

    const readOnlyAction = [PermissionTypes.READ];
    const createAction = readOnlyAction.concat([PermissionTypes.CREATE]);
    const updateAction = createAction.concat([PermissionTypes.UPDATE]);

    const field = new Field('key', { isWritableOnce: true, isReadable: true});
    const readOnlyField = new ReadOnlyField('key', { isWritableOnce: true, isReadable: true});
    const adminField = new AdminWritableField('key', { isWritable: true, isReadable: true});
    const schemaDefinedPermsField = new Field('key', {
      canWriteOnCreate: (bundle) => {
        return Promise.resolve(bundle.account_type === 'user' || bundle.account_type === 'admin');
      },
      canWriteOnUpdate: (bundle) => {
        return Promise.resolve(bundle.account_type === 'admin');
      }
    });


    it('should get the authenticatePermissions for full permissions user', function () {
      return field.authenticatePermissions(updateAction, {}).then(permission => {
        permission.should.equal(true);
      });
    });

    it('should NOT allow write and allow read for ReadOnlyField', function () {
      return readOnlyField.authenticatePermissions(updateAction, {}).then(permission => {
        permission.should.equal(false);
        return readOnlyField.authenticatePermissions(createAction, {}).then(permission => {
          permission.should.equal(false);
          return readOnlyField.authenticatePermissions(readOnlyAction, {}).then(permission => {
            permission.should.equal(true);
          });
        });
      });
    });

    it('should NOT allow write for non admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(updateAction, { account_type: 'user' }).then(permission => {
        permission.should.to.equal(false);
        return adminField.authenticatePermissions(createAction, { account_type: 'user' }).then(permission => {
          permission.should.equal(false);
          return adminField.authenticatePermissions(readOnlyAction, { account_type: 'user' }).then(permission => {
            permission.should.equal(true);
          });
        });
      });
    });

    it('should allow write for admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(updateAction, { account_type: 'admin' }).then(permission => {
        permission.should.to.equal(true);
        return adminField.authenticatePermissions(createAction, { account_type: 'admin' }).then(permission => {
          permission.should.equal(true);
          return adminField.authenticatePermissions(readOnlyAction, { account_type: 'admin' }).then(permission => {
            permission.should.equal(true);
          });
        });
      });
    });

    it('should have correct permissions for users using Field creation params', function () {
      return schemaDefinedPermsField.authenticatePermissions(readOnlyAction, { account_type: 'user' }).then(permission => {
        permission.should.be.equal(true);
        return schemaDefinedPermsField.authenticatePermissions(createAction, { account_type: 'user' }).then(permission => {
          permission.should.be.equal(true);
          return schemaDefinedPermsField.authenticatePermissions(updateAction, { account_type: 'user' }).then(permission => {
            permission.should.be.equal(false);
          })
        });
      });
    });

    it('should have correct permissions for admins using Field creation params', function () {
      return schemaDefinedPermsField.authenticatePermissions(readOnlyAction, { account_type: 'admin' }).then(permission => {
        permission.should.be.equal(true);
        return schemaDefinedPermsField.authenticatePermissions(createAction, { account_type: 'admin' }).then(permission => {
          permission.should.be.equal(true);
          return schemaDefinedPermsField.authenticatePermissions(updateAction, { account_type: 'admin' }).then(permission => {
            permission.should.be.equal(true);
          })
        });
      });
    });
  });
});
