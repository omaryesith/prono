from typing import List

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja_extra.permissions import IsAuthenticated

from .models import Project, Task
from .schemas import ProjectIn, ProjectOut, TaskIn, TaskOut

projects_router = Router(tags=["Projects"], auth=IsAuthenticated())


@projects_router.post("/", response=ProjectOut)
def create_project(request, payload: ProjectIn):
    project = Project.objects.create(owner=request.auth, **payload.dict())
    return project


@projects_router.get("/", response=List[ProjectOut])
def list_my_projects(request):
    # TODO: Re-enable authentication - currently returns all projects for testing
    return Project.objects.all().prefetch_related("tasks")


@projects_router.get("/{project_id}", response=ProjectOut)
def get_project(request, project_id: int):
    # TODO: Re-enable owner authentication
    project = get_object_or_404(
        Project.objects.prefetch_related("tasks"),
        id=project_id,
    )
    return project


@projects_router.post("/{project_id}/tasks", response=TaskOut)
def create_task(request, project_id: int, payload: TaskIn):
    # TODO: Re-enable owner authentication
    project = get_object_or_404(Project, id=project_id)

    task_data = payload.dict(exclude_none=True)
    assigned_to_id = task_data.pop("assigned_to_id", None)

    task = Task.objects.create(
        project=project, assigned_to_id=assigned_to_id, **task_data
    )
    return task


@projects_router.post("/tasks/{task_id}/complete", response=TaskOut)
def complete_task(request, task_id: int):
    """
    Mark a task as completed and notify via WebSocket.
    """
    task = get_object_or_404(Task, id=task_id)

    if task.project.owner != request.auth:
        return {"message": "You do not have permission to complete this task"}, 403

    task.is_completed = True
    task.save()

    # Send real-time notification to WebSocket clients
    channel_layer = get_channel_layer()
    group_name = f"project_chat_{task.project.id}"

    # Use async_to_sync to call async function from sync context
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "project.message",  # Must match the method name in Consumer
            "sender": "System",
            "text": f"✅ The task '{task.title}' has been completed.",
        },
    )

    return task
