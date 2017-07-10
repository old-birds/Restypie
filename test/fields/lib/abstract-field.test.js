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

    it('should reject unhandled permission', function () {
      return field.authenticatePermissions([PermissionTypes.UPDATE, 'reed'], {}).then(result => {
        result.should.equal(false);
      }, err => {
        err.should.be.an('error');
        err.meta.value.should.equal('reed');
        err.meta.expected.should.contain(PermissionTypes.READ);
        err.meta.expected.should.contain(PermissionTypes.CREATE);
        err.meta.expected.should.contain(PermissionTypes.UPDATE);
      })
    });

    it('should get the authenticatePermissions for full permissions user', function () {
      return field.authenticatePermissions(updateAction, {}).then(permission => {
        permission.should.be.an('array');
      });
    });

    it('should allow read for ReadOnlyField', function () {
      return readOnlyField.authenticatePermissions(readOnlyAction, {}).then(permission => {
        permission.should.be.an('array');
      });
    });


    it('should NOT allow create for ReadOnlyField', function () {
      return readOnlyField.authenticatePermissions(createAction, {}).then(result => {
        result.should.equal(false);
      }, err => {
        err.should.be.an('error');
        err.meta.key.should.equal('key');
      });
    });

    it('should NOT allow update for ReadOnlyField', function () {
      return readOnlyField.authenticatePermissions(updateAction, {}).then(result => {
        result.should.equal(false);
      }, err => {
        err.should.be.an('error');
        err.meta.key.should.equal('key');
      });
    });

    it('should allow read for non admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(readOnlyAction, {account_type: 'user'}).then(permission => {
        permission.should.be.an('array');
      });
    });

    it('should NOT allow create for non admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(createAction, { account_type: 'user' }).then(result => {
        result.should.should.be.an('array');
      }, err => {
        err.should.be.an('error');
        err.meta.key.should.equal('key');
      });
    });

    it('should NOT allow update for non admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(updateAction, { account_type: 'user' }).then(result => {
        result.should.equal(false);
      }, err => {
        err.should.be.an('error');
        err.meta.key.should.equal('key');
      });
    });

    it('should allow write for admin users for AdminWritableField', function () {
      return adminField.authenticatePermissions(updateAction, { account_type: 'admin' }).then(permission => {
        permission.should.be.an('array');
        return adminField.authenticatePermissions(createAction, { account_type: 'admin' }).then(permission => {
          permission.should.be.an('array');
          return adminField.authenticatePermissions(readOnlyAction, { account_type: 'admin' }).then(permission => {
            permission.should.be.an('array');
          });
        });
      });
    });

    it('should have correct permissions for users using Field creation params', function () {
      return schemaDefinedPermsField.authenticatePermissions(readOnlyAction, { account_type: 'user' }).then(permission => {
        permission.should.be.an('array');
        return schemaDefinedPermsField.authenticatePermissions(createAction, { account_type: 'user' }).then(permission => {
          permission.should.be.an('array');
          return schemaDefinedPermsField.authenticatePermissions(updateAction, { account_type: 'user' }).then(result => {
            result.should.be.an('array');
          }, err => {
            err.should.be.an('error');
            err.meta.should.be.an('object');
            err.message.should.be.a('string');
            err.code.should.be.a('string');
            err.meta.should.be.an('object');
            err.meta.key.should.equal('key');
          })
        });
      });
    });

    it('should have correct permissions for admins using Field creation params', function () {
      return schemaDefinedPermsField.authenticatePermissions(readOnlyAction, { account_type: 'admin' }).then(permission => {
        permission.should.be.an('array');
        return schemaDefinedPermsField.authenticatePermissions(createAction, { account_type: 'admin' }).then(permission => {
          permission.should.be.an('array');
          return schemaDefinedPermsField.authenticatePermissions(updateAction, { account_type: 'admin' }).then(permission => {
            permission.should.be.an('array');
          })
        });
      });
    });
  });
});
