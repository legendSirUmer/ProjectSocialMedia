# transactionConcurrency.py
"""
A concurrency utility for database transactions, providing a custom implementation of Django's transaction.atomic context manager.
"""

from functools import wraps
from django.db import connections, DEFAULT_DB_ALIAS, DatabaseError

class TransactionAtomic:
    """
    Custom context manager for database transactions, similar to django.db.transaction.atomic.
    Usage:
        with TransactionAtomic():
            # critical section
    """
    def __init__(self, using=None, savepoint=True):
        self.using = using or DEFAULT_DB_ALIAS
        self.savepoint = savepoint
        self.connection = connections[self.using]
        self.savepoint_id = None
        self.exit_exception = None

    def __enter__(self):
        if self.savepoint:
            self.savepoint_id = self.connection.savepoint()
        else:
            self.connection.set_autocommit(False)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.savepoint:
            if exc_type is None:
                try:
                    self.connection.savepoint_commit(self.savepoint_id)
                except DatabaseError:
                    self.connection.savepoint_rollback(self.savepoint_id)
                    raise
            else:
                self.connection.savepoint_rollback(self.savepoint_id)
        else:
            if exc_type is None:
                try:
                    self.connection.commit()
                except DatabaseError:
                    self.connection.rollback()
                    raise
            else:
                self.connection.rollback()
            self.connection.set_autocommit(True)
        return False
