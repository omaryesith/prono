from datetime import date, datetime
from typing import List, Optional

from ninja import Schema


class TaskIn(Schema):
    """
    Input schema to create or update a task.
    """

    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to_id: Optional[int] = None


class TaskOut(Schema):
    """
    Output schema to return a task.
    """

    id: int
    title: str
    is_completed: bool
    due_date: Optional[date] = None
    assigned_to_id: Optional[int] = None


class ProjectIn(Schema):
    """
    Input schema to create a project.
    """

    name: str
    description: Optional[str] = None


class ProjectOut(Schema):
    """
    Output schema for a project (includes owner and total assigned tasks).
    """

    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    created_at: datetime
    tasks: List[TaskOut]

    @staticmethod
    def resolve_tasks(obj):
        """
        Uses ORM logic to retrieve the task list.
        """
        return obj.tasks.all()
