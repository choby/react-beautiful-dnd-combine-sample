import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { v4 } from "uuid";
import Column from "./column";

const initialData = {
    tasks: {
        'task-1': { id: 'task-1', content: 'Take out the garbage' },
        'task-2': { id: 'task-2', content: 'Watch my favorite show' },
        'task-3': { id: 'task-3', content: 'Charge my phone' },
        'task-4': { id: 'task-4', content: 'Cook dinner' },
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'To do',
            taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
        },
        'column-2': {
            id: 'column-2',
            title: 'In progress',
            taskIds: [],
        },
        'column-3': {
            id: 'column-3',
            title: 'Done',
            taskIds: [],
        }
    },
    // Facilitate reordering of the columns
    columnOrder: ['column-1', 'column-2', 'column-3'],
    group: {}
};

export interface IColumn {
    id: string;
    taskIds: number[];
    title: string;
}
export interface ITask {
    id: string;
    content: string;
}

class Index extends React.Component {
    state = initialData;

    onDragEnd = result => {
        document.body.style.color = 'inherit';
        document.body.style.backgroundColor = 'inherit';
        console.log("result:", result);
        let { destination, source, draggableId, combine } = result;

        destination = destination ?? combine;


        if (!destination && !combine) {
            return;
        }


        let state = { ...this.state };

        //合并
        if (result.combine) {
            const d1 = this.state.tasks[result.draggableId];
            const d2 = this.state.tasks[result.combine.draggableId];

            const group = {
                ...this.state.group,

            };

            group[v4()] = [d1, d2];
            state.group = group;

        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];

        if (start === finish) {

            let newTaskIds = Array.from(start.taskIds);

            if (result.combine) { //如果时合并, 则要把当前容器的tasks删除
                newTaskIds = newTaskIds.filter(d => d !== result.draggableId && d !== result.combine.draggableId);
            } else {
                newTaskIds.splice(source.index, 1);
                newTaskIds.splice(destination.index, 0, draggableId);
            }

            const newColumn = {
                ...finish,
                taskIds: newTaskIds,
            };

            state = {
                ...this.state,
                ...state,
                columns: {
                    ...this.state.columns,
                    [newColumn.id]: newColumn,
                },
            };

            this.setState(state);
            return;
        }

        let newStart = {};
        let newFinish = {};
        let finishTaskIds = [];

        if (destination.droppableId.split("-").length === 5) {
            let group = state.group[destination.droppableId];
            group.splice(destination.index, 0, this.state.tasks[draggableId]);
        }
        else {
            finishTaskIds = Array.from(finish.taskIds);
            if (result.combine) {
                finishTaskIds = finishTaskIds.filter(d => d !== result.draggableId && d !== result.combine.draggableId);
            }
            else
                finishTaskIds.splice(destination.index, 0, draggableId);
            newFinish = {
                ...finish,
                taskIds: finishTaskIds,
            };
        }


        if (source.droppableId.split("-").length === 5) {
            const group = {
                ...this.state.group,
            };

            group[source.droppableId] = Array.from(group[source.droppableId]).filter(d => d.id !== draggableId);
            if (group[source.droppableId].length === 1) {
                finishTaskIds.splice(destination.index, 0, group[source.droppableId][0].id);
                delete group[source.droppableId];
            }
            state.group = group;
        }
        else {
            // Moving from one list to another
            const startTaskIds = Array.from(start.taskIds);
            startTaskIds.splice(source.index, 1);
            newStart = {
                ...start,
                taskIds: startTaskIds,
            };
        }



        state = {
            ...this.state,
            ...state,
            columns: {
                ...this.state.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        };
        this.setState(state);
    };

    render() {
        return (
            <DragDropContext
                onDragEnd={this.onDragEnd}
            >
                {/* {this.state.columnOrder.map((columnId) => {
                    const column = this.state.columns[columnId];
                    const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

                    return <Column key={column.id} column={column} tasks={tasks} group={this.state.group} />;
                })} */}

                <Column key={"column-1"} column={this.state.columns["column-1"]} tasks={this.state.columns["column-1"].taskIds.map(taskId => this.state.tasks[taskId])} group={{}} />
                <Column key={"column-2"} column={this.state.columns["column-2"]} tasks={this.state.columns["column-2"].taskIds.map(taskId => this.state.tasks[taskId])} group={this.state.group} />

            </DragDropContext>
        );
    }
}

export default Index;