const CollabServer = require('@pdftron/collab-server');
const Generator = require('@pdftron/collab-sql-resolver-generator');
require('dotenv').config()

const resolvers = Generator({
  client: 'mssql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      encrypt: true
    }
  },
  getDatabaseTimestamp: (unixTimestamp) => {
    // If your database uses ISO strings
    return new Date(unixTimestamp).toISOString();
  },
  parseToUnixTimestamp: (yourDBTimestamp) => {
    return new Date(yourDBTimestamp).getTime()
  },
  info: {
    Users: {
      table: "Users",
      writeMiddleware: [
        ({ type, data, next, ctx }) => {
          if (type === 'create') {
            data.SourceUserId = '123'
            data.Email = 'test@test.com'
            data.IsDocumentController = true
          }
          next(data, ctx)
        }
      ],
      columns: {
        id: 'Id',
        userName: 'UserName',
        email: 'Email',
        type: 'Type',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
      }
    },
    Annotations: {
      table: "Markups",
      columns: {
        id: 'Id',
        annotationId: 'Identifier',
        xfdf: 'Content',
        annotContents: 'AnnotContents',
        authorId: 'CreatedByUserId',
        documentId: 'DocumentId',
        pageNumber: 'PageNumber',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate',
        inReplyTo: 'InReplyTo',
      }
    },
    Documents: {
      table: 'Documents',
      columns: {
        id: 'Id',
        authorId: 'CreatedByUserId',
        isPublic: 'IsPublic',
        name: 'DocumentName',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
      }
    },
    AnnotationMembers: {
      table: 'AnnotationMembers',
      columns: {
        id: 'Id',
        userId: 'CreatedByUserId',
        documentId: 'DocumentId',
        annotationId: 'MarkupId',
        lastRead: 'LastRead',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate',
        annotationCreatedAt: 'MarkupCreatedDate'
      }
    },
    DocumentMembers: {
      table: 'MarkupDocuments',
      columns: {
        id: 'Id',
        userId: 'CreatedByUserId',
        documentId: 'DocumentId',
        lastRead: 'LastRead',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
      }
    },
    Mentions: {
      table: 'Mentions',
      columns: {
        id: 'Id',
        userId: 'CreatedByUserId',
        documentId: 'DocumentId',
        annotationId: 'MarkupId',
        readBeforeMention: 'ReadBeforeMention',
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
      }
    }
  }
})

const server = new CollabServer({
  resolvers
});

server.start(parseInt(process.env.PORT))